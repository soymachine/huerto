-- Run these in Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE OR REPLACE FUNCTION shift_garden_rows(p_garden_id uuid, p_delta int)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE plantings SET row_idx = row_idx + p_delta WHERE garden_id = p_garden_id;
  UPDATE notes    SET row_idx = row_idx + p_delta WHERE garden_id = p_garden_id;
END;
$$;

CREATE OR REPLACE FUNCTION shift_garden_cols(p_garden_id uuid, p_delta int)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE plantings SET col_idx = col_idx + p_delta WHERE garden_id = p_garden_id;
  UPDATE notes    SET col_idx = col_idx + p_delta WHERE garden_id = p_garden_id;
END;
$$;
