--- Create table to store reviewers info
CREATE TABLE info.reviewer (
  user_id INTEGER REFERENCES info.user(id) ON DELETE CASCADE,
  pull_request_id INTEGER REFERENCES info.pull_request(id) ON DELETE CASCADE,
  number_of_comments INT NOT NULL,
  status VARCHAR (10) NOT NULL,
  review_quality VARCHAR (10) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create trigger to automatically update the `updated_on` field on each update
CREATE TRIGGER update_last_modification_date
  BEFORE UPDATE ON info.reviewer
  FOR EACH ROW EXECUTE PROCEDURE update_last_modification_date();
