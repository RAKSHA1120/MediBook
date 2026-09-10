IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Users]') AND name = 'ProfileImageUrl')
BEGIN
    ALTER TABLE [Users] ADD [ProfileImageUrl] nvarchar(max) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Patients]') AND name = 'ProfileImageUrl')
BEGIN
    ALTER TABLE [Patients] ADD [ProfileImageUrl] nvarchar(max) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Doctors]') AND name = 'ProfileImageUrl')
BEGIN
    ALTER TABLE [Doctors] ADD [ProfileImageUrl] nvarchar(max) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Hospitals]') AND name = 'ProfileImageUrl')
BEGIN
    ALTER TABLE [Hospitals] ADD [ProfileImageUrl] nvarchar(max) NULL;
END
