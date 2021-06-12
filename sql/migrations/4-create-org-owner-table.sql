--- Create table to store organizations or user owners
CREATE TABLE info.org_owner (
  id INT PRIMARY KEY,
  name VARCHAR (150) NOT NULL,
  type VARCHAR (30) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--- Create indexes to improve search performance
CREATE INDEX IF NOT EXISTS org_owner_id_idx
  ON info.org_owner(id);

-- Create trigger to automatically update the `updated_on` field on each update
CREATE TRIGGER update_last_modification_date
  BEFORE UPDATE ON info.org_owner
  FOR EACH ROW EXECUTE PROCEDURE update_last_modification_date();
