BEGIN TRANSACTION;
GO

CREATE TABLE [AppointmentReschedules] (
    [Id] int NOT NULL IDENTITY,
    [AppointmentId] int NOT NULL,
    [OldAppointmentDate] datetime2 NOT NULL,
    [OldAppointmentTime] time NOT NULL,
    [NewAppointmentDate] datetime2 NOT NULL,
    [NewAppointmentTime] time NOT NULL,
    [Reason] nvarchar(max) NULL,
    [RescheduledByUserId] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_AppointmentReschedules] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AppointmentReschedules_Appointments_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [Appointments] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AppointmentReschedules_Users_RescheduledByUserId] FOREIGN KEY ([RescheduledByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_AppointmentReschedules_AppointmentId] ON [AppointmentReschedules] ([AppointmentId]);
GO

CREATE INDEX [IX_AppointmentReschedules_RescheduledByUserId] ON [AppointmentReschedules] ([RescheduledByUserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260909045751_AddAppointmentReschedules', N'8.0.19');
GO

COMMIT;
GO

