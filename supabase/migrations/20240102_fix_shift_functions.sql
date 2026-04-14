-- Fix shift_garden_rows / shift_garden_cols: add p_from_idx support.
-- Previously these functions shifted ALL rows/cols regardless of position,
-- causing insert row/col to corrupt data (plants before the insertion point
-- would shift too). Now only rows/cols >= p_from_idx are shifted.

CREATE OR REPLACE FUNCTION shift_garden_rows(
  p_garden_id uuid,
  p_delta     int,
  p_from_idx  int DEFAULT 0
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE plantings
     SET row_idx = row_idx + p_delta
   WHERE garden_id = p_garden_id
     AND row_idx  >= p_from_idx;

  UPDATE notes
     SET row_idx = row_idx + p_delta
   WHERE garden_id = p_garden_id
     AND row_idx  >= p_from_idx;
END;
$$;

CREATE OR REPLACE FUNCTION shift_garden_cols(
  p_garden_id uuid,
  p_delta     int,
  p_from_idx  int DEFAULT 0
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE plantings
     SET col_idx = col_idx + p_delta
   WHERE garden_id = p_garden_id
     AND col_idx  >= p_from_idx;

  UPDATE notes
     SET col_idx = col_idx + p_delta
   WHERE garden_id = p_garden_id
     AND col_idx  >= p_from_idx;
END;
$$;
