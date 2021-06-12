# Database migrations

This folder should contain `.sql` scripts that will modify the structure of the database. This includes the creation / modification / deletion of schemas, tables or triggers, among others.

## Create database namespace

:warning: For migration scripts not to collide with other projects that coexist in the same database, **it's imperative that we add a `.marvrc` where we set a namespace exclusive to each project**. 

The `.marvrc` file must have the following structure:

```
{
  "namespace": "<custom name for project's namespace>"
}
```

**The lack of this file may cause unexpected behaviours such as our migrations not running**, as the index of a script may match that of an already executed migration in other projects. 

As an example, let's assume we have a script `1-create-my-schema` schema in our current project. On a different project that shares this same database, one called `1-create-other-schema` may also exist. Both of these migration script have the same index, `1`. 

**If a unique namespace is not set via a `.marvrc` file, only the migration for the project which is deployed in the first place will run** (let's assume it's `1-create-my-schema`). When the other project is deployed, a migration script with index `1` would already have been run in the current namespace, thus' `1-create-other-schema` will not be executed.

Because of this, it's important that we do not forget to add the `.marvrc`, always ensuring that we choose a namespace which is unique to our project. 

## Creating migration scripts

Anytime we need to make changes to the current database structure, it will be necessary to create a new file in this folder with the SQL script that will perform the change.

The **name of the files** in this folder **must** all **follow this structure**:

```
{index}-{brief-script-description}.sql
```

The example below illustrates a valid name for a migration script file:

```
1-create-account-schema.sql
```

As seen in the example, **the name** for all the files in this folder **must start with a number, which will determine the order in which the migration scripts will run.** 

Adding descriptive names to the scripts is recommended, so it's easy to get an idea of what change was introduced without having to look at the SQL code to find out.

If we need to make multiple changes that are not particularly related (ex.: creating two different tables), it would be convenient to split those actions in different migration scripts, rather than creating a longer one that performs multiple actions at once. That could make our migrations folder harder to read, so it should be avoided.

### :warning: Important note regarding migration scripts

As said in earlier paragraphs, the index included at the beginning of each file defines the order in which the migration scripts will be run into our database. Because of this, **it's important to ensure that all of the scripts have the right number assigned**, and that there aren't two or more files with the same index.

This will be especially important once the database have already been deployed, as any error could lead to unexpected behaviours and could even cause data loss. 

## Applying changes to migration scripts 

Other things that should be handled with care are deletion or modification of already deployed scripts.

### :no_entry_sign: Scripts reorder

We may rename our migration scripts anytime, as long as the index remains unchanged. Once a script has been deployed, we should **never modify the order in which it's supposed to run**. 

Doing this could lead to issues with some scripts never running or some of them running multiple times. 

Let's better illustrate this with an example. To begin with, let's assume both of these scripts have already run in our real database:

```
1-create-account-schema.sql
2-create-user-table.sql
```

Now let's suppose we want to create a new table for user roles, and want it to run before the user table creation, so we do this:

```
1-create-account-schema.sql
2-create-role-table.sql
3-create-user-table.sql
```

When changes are deployed, what will happen is the following:

- The `create-role-table` will never run, because a script with index 2 have already run in our database.
- The `create-user-table` will be run again, as its index is higher than the last one that was executed (in this case, 2).

### :no_entry_sign: Script contents' modification

As long as it hasn't been deployed in any real environment, we can change the contents of our scripts as many times as we need. Once deployed, though, we should **never modify the contents of any of our migration scripts.** 

Keep in mind that those scripts have already been executed, thus **any change you make to them will NOT be automatically be applied**. If you want to perform a change to a table you previously created, for example, then you need to create a new script that alters that table the way you need. 

Also, keep in mind that **these scripts allow us to have a history of all of the changes that our database have been through**. Making any changes to them will cause us to have a wrong view of what really have been its evolution during time. Because of this, it's not recommended to change any of the migration scripts once they have been run into database. 

### :no_entry_sign: Scripts deletion

Just like with the case of modifying scripts, we should not delete any script that have already been promoted to a real environment. 

**If we want to undo a change introduced in any of the scripts that have already been deployed**, we CANNOT just remove the migration script in the folder. Instead, **we'll need to create a new one that executes the SQL senteces required to manually undo those changes** (ex.: if we want to undo the creation of a table, we must create a script that delete that table). 

As with scripts modification, **their removal would also cause us to loss data on how has our database changed** since its creation. Thus, it's not recommended to remove them as they're part of our database's history.
