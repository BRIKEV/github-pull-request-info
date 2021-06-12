--- Create table to store user accounts
CREATE TABLE info.user (
  id INT PRIMARY KEY,
  username VARCHAR (50) UNIQUE NOT NULL,
  avatar_url VARCHAR(200) NOT NULL,
  url VARCHAR(200) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--- Create indexes to improve search performance
CREATE INDEX IF NOT EXISTS user_id_idx
  ON info.user(id);

-- Create trigger to automatically update the `updated_on` field on each update
CREATE TRIGGER update_last_modification_date
  BEFORE UPDATE ON info.user
  FOR EACH ROW EXECUTE PROCEDURE update_last_modification_date();
