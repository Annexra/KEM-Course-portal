-- Mock-test attempt rules and server-owned question snapshots.

ALTER TABLE assessments
    ADD COLUMN IF NOT EXISTS cooldown_minutes INT NOT NULL DEFAULT 0
        CHECK (cooldown_minutes >= 0),
    ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ;

ALTER TABLE attempts
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS attempts_student_assessment_started_idx
    ON attempts(student_id, assessment_id, started_at DESC);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_approved_student()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles p
        JOIN user_roles ur ON ur.user_id = p.id
        JOIN roles r ON r.id = ur.role_id
        WHERE p.id = auth.uid()
          AND p.status = 'approved'
          AND r.name = 'student'
    );
$$;

REVOKE ALL ON FUNCTION is_approved_student() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_approved_student() TO authenticated;

DROP POLICY IF EXISTS "Approved students can view published mock tests" ON assessments;
CREATE POLICY "Approved students can view published mock tests" ON assessments
    FOR SELECT USING (
        type = 'mock_test'
        AND status = 'published'
        AND (available_from IS NULL OR available_from <= NOW())
        AND (available_until IS NULL OR available_until > NOW())
                AND is_approved_student()
        AND (
            course_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM course_enrollments ce
                WHERE ce.course_id = assessments.course_id
                  AND ce.student_id = auth.uid()
                  AND ce.status = 'active'
            )
        )
    );

DROP POLICY IF EXISTS "Students can view their own attempts" ON attempts;
CREATE POLICY "Students can view their own attempts" ON attempts
    FOR SELECT USING (
        student_id = auth.uid()
        AND is_approved_student()
    );

DROP POLICY IF EXISTS "Students can view submitted answer reviews" ON attempt_answers;
CREATE POLICY "Students can view submitted answer reviews" ON attempt_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM attempts a
            WHERE a.id = attempt_answers.attempt_id
              AND a.student_id = auth.uid()
              AND a.submitted_at IS NOT NULL
        )
                AND is_approved_student()
    );

CREATE OR REPLACE FUNCTION start_mock_test(p_assessment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID := auth.uid();
    v_assessment assessments%ROWTYPE;
    v_attempt attempts%ROWTYPE;
    v_attempt_count INT;
    v_last_submitted_at TIMESTAMPTZ;
    v_snapshot JSONB;
    v_safe_questions JSONB;
BEGIN
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM profiles p
        JOIN user_roles ur ON ur.user_id = p.id
        JOIN roles r ON r.id = ur.role_id
        WHERE p.id = v_student_id AND p.status = 'approved' AND r.name = 'student'
    ) THEN
        RAISE EXCEPTION 'An approved student account is required';
    END IF;

    SELECT * INTO v_assessment
    FROM assessments
    WHERE id = p_assessment_id
      AND type = 'mock_test'
      AND status = 'published'
      AND (available_from IS NULL OR available_from <= NOW())
      AND (available_until IS NULL OR available_until > NOW())
      AND (course_id IS NULL OR EXISTS (
          SELECT 1 FROM course_enrollments ce
          WHERE ce.course_id = assessments.course_id
            AND ce.student_id = v_student_id
            AND ce.status = 'active'
      ))
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Mock test is unavailable';
    END IF;

    SELECT * INTO v_attempt
    FROM attempts
    WHERE assessment_id = p_assessment_id
      AND student_id = v_student_id
      AND submitted_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1;

    IF FOUND THEN
        SELECT COALESCE(jsonb_agg(
            (aa.question_snapshot - 'correct_option_id' - 'explanation')
            || jsonb_build_object('options', (
                SELECT COALESCE(jsonb_agg(option_snapshot - 'is_correct' ORDER BY option_position), '[]'::JSONB)
                FROM jsonb_array_elements(aa.question_snapshot->'options') WITH ORDINALITY AS option_data(option_snapshot, option_position)
            )) ORDER BY (aa.question_snapshot->>'position')::INT
        ), '[]'::JSONB)
        INTO v_safe_questions
        FROM attempt_answers aa
        WHERE aa.attempt_id = v_attempt.id;

        RETURN jsonb_build_object(
            'attempt_id', v_attempt.id,
            'attempt_number', v_attempt.attempt_number,
            'title', v_assessment.title,
            'duration_minutes', v_assessment.duration_minutes,
            'pass_percentage', v_assessment.pass_percentage,
            'negative_marking', v_assessment.negative_marking,
            'started_at', v_attempt.started_at,
            'expires_at', v_attempt.expires_at,
            'questions', v_safe_questions
        );
    END IF;

    SELECT COUNT(*), MAX(submitted_at)
    INTO v_attempt_count, v_last_submitted_at
    FROM attempts
    WHERE assessment_id = p_assessment_id AND student_id = v_student_id;

    IF v_attempt_count >= v_assessment.max_attempts THEN
        RAISE EXCEPTION 'Maximum attempts reached';
    END IF;

    IF v_last_submitted_at IS NOT NULL
       AND NOW() < v_last_submitted_at + make_interval(mins => v_assessment.cooldown_minutes) THEN
        RAISE EXCEPTION 'Cooldown is still active';
    END IF;

    SELECT COALESCE(jsonb_agg(
        question_snapshot || jsonb_build_object('position', question_position)
        ORDER BY question_order
    ), '[]'::JSONB)
    INTO v_snapshot
    FROM (
        SELECT ordered_questions.*,
               ROW_NUMBER() OVER (ORDER BY question_order)::INT AS question_position
        FROM (
            SELECT jsonb_build_object(
                'question_id', q.id,
                'text', q.text,
                'explanation', COALESCE(q.explanation, ''),
                'marks', q.marks,
                'correct_option_id', correct_option.id,
                'subject', s.name,
                'topic', t.name,
                'options', (
                    SELECT COALESCE(jsonb_agg(
                        jsonb_build_object('id', qo.id, 'text', qo.text, 'is_correct', qo.is_correct)
                        ORDER BY CASE WHEN v_assessment.randomize_options THEN random() ELSE qo.sort_order END
                    ), '[]'::JSONB)
                    FROM question_options qo
                    WHERE qo.question_id = q.id
                )
            ) AS question_snapshot,
            CASE WHEN v_assessment.randomize_questions THEN random() ELSE aq.sort_order::FLOAT END AS question_order
            FROM assessment_questions aq
            JOIN questions q ON q.id = aq.question_id AND q.deleted_at IS NULL
            LEFT JOIN subtopics st ON st.id = q.subtopic_id
            LEFT JOIN topics t ON t.id = st.topic_id
            LEFT JOIN subjects s ON s.id = t.subject_id
            LEFT JOIN LATERAL (
                SELECT qo.id
                FROM question_options qo
                WHERE qo.question_id = q.id AND qo.is_correct
                ORDER BY qo.sort_order
                LIMIT 1
            ) correct_option ON TRUE
            WHERE aq.assessment_id = p_assessment_id
              AND correct_option.id IS NOT NULL
              AND (SELECT COUNT(*) FROM question_options qo WHERE qo.question_id = q.id) >= 2
        ) ordered_questions
    ) questions;

    IF jsonb_array_length(v_snapshot) = 0 THEN
        RAISE EXCEPTION 'Mock test has no valid questions';
    END IF;

    INSERT INTO attempts (
        assessment_id, student_id, attempt_number, result, max_possible_score, expires_at
    ) VALUES (
        p_assessment_id,
        v_student_id,
        v_attempt_count + 1,
        'in_progress',
        (SELECT SUM((question->>'marks')::FLOAT) FROM jsonb_array_elements(v_snapshot) AS item(question)),
        NOW() + make_interval(mins => v_assessment.duration_minutes)
    )
    RETURNING * INTO v_attempt;

    INSERT INTO attempt_answers (attempt_id, question_id, question_snapshot)
    SELECT v_attempt.id, (question->>'question_id')::UUID, question
    FROM jsonb_array_elements(v_snapshot) AS item(question);

    SELECT COALESCE(jsonb_agg(
        (question - 'correct_option_id' - 'explanation')
        || jsonb_build_object('options', (
            SELECT COALESCE(jsonb_agg(option_snapshot - 'is_correct' ORDER BY option_position), '[]'::JSONB)
            FROM jsonb_array_elements(question->'options') WITH ORDINALITY AS option_data(option_snapshot, option_position)
        )) ORDER BY question_position
    ), '[]'::JSONB)
    INTO v_safe_questions
    FROM jsonb_array_elements(v_snapshot) WITH ORDINALITY AS question_data(question, question_position);

    RETURN jsonb_build_object(
        'attempt_id', v_attempt.id,
        'attempt_number', v_attempt.attempt_number,
        'title', v_assessment.title,
        'duration_minutes', v_assessment.duration_minutes,
        'pass_percentage', v_assessment.pass_percentage,
        'negative_marking', v_assessment.negative_marking,
        'started_at', v_attempt.started_at,
        'expires_at', v_attempt.expires_at,
        'questions', v_safe_questions
    );
END;
$$;

CREATE OR REPLACE FUNCTION save_mock_test_answers(p_attempt_id UUID, p_answers JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt attempts%ROWTYPE;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT * INTO v_attempt
    FROM attempts
    WHERE id = p_attempt_id AND student_id = auth.uid()
    FOR UPDATE;

    IF NOT FOUND OR v_attempt.submitted_at IS NOT NULL THEN
        RAISE EXCEPTION 'Attempt is unavailable';
    END IF;

    IF v_attempt.expires_at <= NOW() THEN
        RAISE EXCEPTION 'Attempt has expired';
    END IF;

    IF jsonb_typeof(COALESCE(p_answers, '{}'::JSONB)) <> 'object' THEN
        RAISE EXCEPTION 'Answers must be an object';
    END IF;

    UPDATE attempt_answers aa
    SET selected_option_id = answer.value::UUID
    FROM jsonb_each_text(COALESCE(p_answers, '{}'::JSONB)) AS answer(key, value)
    WHERE aa.attempt_id = v_attempt.id
      AND aa.question_id = answer.key::UUID
      AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(aa.question_snapshot->'options') AS option_data(option_snapshot)
          WHERE (option_snapshot->>'id')::UUID = answer.value::UUID
      );
END;
$$;

CREATE OR REPLACE FUNCTION submit_mock_test(p_attempt_id UUID, p_answers JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID := auth.uid();
    v_attempt attempts%ROWTYPE;
    v_assessment assessments%ROWTYPE;
    v_score FLOAT;
    v_max_score FLOAT;
    v_percentage FLOAT;
    v_result TEXT;
    v_reviews JSONB;
BEGIN
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT * INTO v_attempt
    FROM attempts
    WHERE id = p_attempt_id AND student_id = v_student_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attempt not found';
    END IF;

    SELECT * INTO v_assessment FROM assessments WHERE id = v_attempt.assessment_id;

    IF v_attempt.submitted_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'attempt_id', v_attempt.id,
            'score', v_attempt.score,
            'max_possible_score', v_attempt.max_possible_score,
            'percentage', v_attempt.percentage,
            'result', v_attempt.result,
            'submitted_at', v_attempt.submitted_at,
            'time_spent_seconds', v_attempt.time_spent_seconds
        );
    END IF;

    IF jsonb_typeof(COALESCE(p_answers, '{}'::JSONB)) <> 'object' THEN
        RAISE EXCEPTION 'Answers must be an object';
    END IF;

    IF v_attempt.expires_at IS NULL OR v_attempt.expires_at > NOW() THEN
        UPDATE attempt_answers aa
        SET selected_option_id = answer.value::UUID
        FROM jsonb_each_text(COALESCE(p_answers, '{}'::JSONB)) AS answer(key, value)
        WHERE aa.attempt_id = v_attempt.id
          AND aa.question_id = answer.key::UUID
          AND EXISTS (
              SELECT 1
              FROM jsonb_array_elements(aa.question_snapshot->'options') AS option_data(option_snapshot)
              WHERE (option_snapshot->>'id')::UUID = answer.value::UUID
          );
    END IF;

    UPDATE attempt_answers aa
    SET is_correct = (aa.question_snapshot->>'correct_option_id')::UUID = aa.selected_option_id,
        marks_awarded = CASE
            WHEN aa.selected_option_id IS NULL THEN 0
            WHEN (aa.question_snapshot->>'correct_option_id')::UUID = aa.selected_option_id
                THEN (aa.question_snapshot->>'marks')::FLOAT
            ELSE -v_assessment.negative_marking
        END
    WHERE aa.attempt_id = v_attempt.id;

    SELECT COALESCE(SUM(marks_awarded), 0), COALESCE(SUM((question_snapshot->>'marks')::FLOAT), 0)
    INTO v_score, v_max_score
    FROM attempt_answers
    WHERE attempt_id = v_attempt.id;

    v_score := GREATEST(v_score, 0);
    v_percentage := CASE WHEN v_max_score = 0 THEN 0 ELSE v_score / v_max_score * 100 END;
    v_result := CASE WHEN v_percentage >= v_assessment.pass_percentage THEN 'pass' ELSE 'fail' END;

    UPDATE attempts
    SET submitted_at = NOW(),
        score = v_score,
        max_possible_score = v_max_score,
        percentage = v_percentage,
        result = v_result,
        time_spent_seconds = LEAST(
            GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)))::INT),
            v_assessment.duration_minutes * 60
        )
    WHERE id = v_attempt.id
    RETURNING * INTO v_attempt;

    SELECT COALESCE(jsonb_agg(
        aa.question_snapshot || jsonb_build_object(
            'selected_option_id', aa.selected_option_id,
            'is_correct', COALESCE(aa.is_correct, FALSE),
            'marks_awarded', aa.marks_awarded
        ) ORDER BY (aa.question_snapshot->>'position')::INT
    ), '[]'::JSONB)
    INTO v_reviews
    FROM attempt_answers aa
    WHERE aa.attempt_id = v_attempt.id;

    RETURN jsonb_build_object(
        'attempt_id', v_attempt.id,
        'title', v_assessment.title,
        'score', v_attempt.score,
        'max_possible_score', v_attempt.max_possible_score,
        'percentage', v_attempt.percentage,
        'result', v_attempt.result,
        'pass_percentage', v_assessment.pass_percentage,
        'submitted_at', v_attempt.submitted_at,
        'time_spent_seconds', v_attempt.time_spent_seconds,
        'questions', v_reviews
    );
END;
$$;

REVOKE ALL ON FUNCTION start_mock_test(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION save_mock_test_answers(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION submit_mock_test(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION start_mock_test(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_mock_test_answers(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_mock_test(UUID, JSONB) TO authenticated;