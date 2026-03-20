-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Adds the optional planting date column to the plantings table

ALTER TABLE plantings ADD COLUMN IF NOT EXISTS planted_at DATE NULL;
