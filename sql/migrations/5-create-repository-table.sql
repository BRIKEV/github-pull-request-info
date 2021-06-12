--- Create table to store repositories
CREATE TABLE info.repository (
  id INT PRIMARY KEY,
  title VARCHAR (150) NOT NULL,
  owner_id INTEGER REFERENCES info.org_owner(id) ON DELETE CASCADE,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--- Create indexes to improve search performance
CREATE INDEX IF NOT EXISTS repository_id_idx
  ON info.repository(id);

-- Create trigger to automatically update the `updated_on` field on each update
CREATE TRIGGER update_last_modification_date
  BEFORE UPDATE ON info.repository
  FOR EACH ROW EXECUTE PROCEDURE update_last_modification_date();
