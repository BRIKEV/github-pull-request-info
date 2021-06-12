--- Create table to store pull request info
CREATE TABLE info.pull_request (
  id INT PRIMARY KEY,
  user_id INTEGER REFERENCES info.user(id) ON DELETE CASCADE,
  repository_id INTEGER REFERENCES info.repository(id) ON DELETE CASCADE,
  number INT NOT NULL,
  commits INT NOT NULL,
  additions INT NOT NULL,
  deletions INT NOT NULL,
  changed_files INT NOT NULL,
  state VARCHAR (10) NOT NULL,
  type VARCHAR (10) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--- Create indexes to improve search performance
CREATE INDEX IF NOT EXISTS user_number_idx
  ON info.pull_request(number);

-- Create trigger to automatically update the `updated_on` field on each update
CREATE TRIGGER update_last_modification_date
  BEFORE UPDATE ON info.pull_request
  FOR EACH ROW EXECUTE PROCEDURE update_last_modification_date();
