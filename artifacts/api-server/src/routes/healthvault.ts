import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, healthEventsTable, profilesTable, remindersTable } from "@workspace/db";
import {
  CompleteReminderParams,
  CompleteReminderResponse,
  CreateEventBody,
  CreateEventParams,
  CreateEventResponse,
  CreateProfileBody,
  CreateProfileResponse,
  CreateReminderBody,
  CreateReminderResponse,
  DeleteEventParams,
  DeleteProfileParams,
  DeleteProfileResponse,
  DeleteEventResponse,
  GetDashboardResponse,
  GetProfileParams,
  GetProfileResponse,
  GetProfileSummaryParams,
  GetProfileSummaryResponse,
  HealthEvent,
  ListEventsParams,
  ListEventsResponse,
  ListProfilesResponse,
  ListRemindersResponse,
  Profile,
  Reminder,
  UpdateEventBody,
  UpdateEventParams,
  UpdateEventResponse,
  UpdateProfileBody,
  UpdateProfileParams,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const colors = ["sage", "lavender", "peach", "sky", "butter"];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function profileView(profile: typeof profilesTable.$inferSelect, events: typeof healthEventsTable.$inferSelect[]): Profile {
  const profileEvents = events.filter((event) => event.profileId === profile.id);
  return {
    id: profile.id,
    name: profile.name,
    relationship: profile.relationship,
    initials: initials(profile.name),
    color: profile.color,
    dateOfBirth: profile.dateOfBirth,
    bloodGroup: profile.bloodGroup,
    eventCount: profileEvents.length,
    lastUpdated: profileEvents[0]?.date ?? null,
  };
}

function eventView(event: typeof healthEventsTable.$inferSelect): HealthEvent {
  return {
    id: event.id,
    profileId: event.profileId,
    type: event.type as HealthEvent["type"],
    title: event.title,
    date: new Date(`${event.date}T00:00:00Z`),
    description: event.description,
    provider: event.provider,
    location: event.location,
    medications: event.medications ?? [],
    tags: event.tags ?? [],
    followUp: event.followUp,
  };
}

function reminderView(reminder: typeof remindersTable.$inferSelect): Reminder {
  return {
    id: reminder.id,
    profileId: reminder.profileId,
    title: reminder.title,
    date: new Date(`${reminder.date}T00:00:00Z`),
    detail: reminder.detail,
    completed: reminder.completed,
  };
}

router.get("/dashboard", async (_req, res): Promise<void> => {
  const [profiles, events, reminders] = await Promise.all([
    db.select().from(profilesTable).orderBy(asc(profilesTable.id)),
    db.select().from(healthEventsTable).orderBy(desc(healthEventsTable.date)),
    db.select().from(remindersTable).where(eq(remindersTable.completed, false)).orderBy(asc(remindersTable.date)),
  ]);
  const profileViews = profiles.map((profile) => profileView(profile, events));
  const currentMonth = new Date().toISOString().slice(0, 7);
  const recentEvents = events.slice(0, 5).map(eventView);
  const response = {
    profiles: profileViews,
    eventsThisMonth: events.filter((event) => event.date.startsWith(currentMonth)).length,
    upcomingReminders: reminders.length,
    recentEvents,
    activeProfileId: profileViews[0]?.id ?? 0,
  };
  res.json(GetDashboardResponse.parse(response));
});

router.get("/profiles", async (_req, res): Promise<void> => {
  const [profiles, events] = await Promise.all([
    db.select().from(profilesTable).orderBy(asc(profilesTable.id)),
    db.select().from(healthEventsTable).orderBy(desc(healthEventsTable.date)),
  ]);
  res.json(ListProfilesResponse.parse(profiles.map((profile) => profileView(profile, events))));
});

router.post("/profiles", async (req, res): Promise<void> => {
  const parsed = CreateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [profile] = await db.insert(profilesTable).values({
    name: parsed.data.name,
    relationship: parsed.data.relationship,
    dateOfBirth: parsed.data.dateOfBirth ?? null,
    bloodGroup: parsed.data.bloodGroup ?? null,
    color: parsed.data.color ?? colors[Math.floor(Math.random() * colors.length)],
  }).returning();
  res.status(201).json(CreateProfileResponse.parse(profileView(profile, [])));
});

router.get("/profiles/:profileId", async (req, res): Promise<void> => {
  const parsed = GetProfileParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, parsed.data.profileId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const events = await db.select().from(healthEventsTable).where(eq(healthEventsTable.profileId, profile.id)).orderBy(desc(healthEventsTable.date));
  res.json(GetProfileResponse.parse(profileView(profile, events)));
});

router.patch("/profiles/:profileId", async (req, res): Promise<void> => {
  const params = UpdateProfileParams.safeParse(req.params);
  const body = UpdateProfileBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates = {
    ...body.data,
    dateOfBirth: body.data.dateOfBirth ?? undefined,
    bloodGroup: body.data.bloodGroup ?? undefined,
    color: body.data.color ?? undefined,
  };
  const [profile] = await db.update(profilesTable).set(updates).where(eq(profilesTable.id, params.data.profileId)).returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const events = await db.select().from(healthEventsTable).where(eq(healthEventsTable.profileId, profile.id)).orderBy(desc(healthEventsTable.date));
  res.json(UpdateProfileResponse.parse(profileView(profile, events)));
});

router.delete("/profiles/:profileId", async (req, res): Promise<void> => {
  const parsed = DeleteProfileParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [profile] = await db.delete(profilesTable).where(eq(profilesTable.id, parsed.data.profileId)).returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/profiles/:profileId/events", async (req, res): Promise<void> => {
  const parsed = ListEventsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const events = await db.select().from(healthEventsTable).where(eq(healthEventsTable.profileId, parsed.data.profileId)).orderBy(desc(healthEventsTable.date));
  res.json(ListEventsResponse.parse(events.map(eventView)));
});

router.post("/profiles/:profileId/events", async (req, res): Promise<void> => {
  const params = CreateEventParams.safeParse(req.params);
  const body = CreateEventBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [event] = await db.insert(healthEventsTable).values({
    profileId: params.data.profileId,
    type: body.data.type,
    title: body.data.title,
    date: body.data.date.toISOString().slice(0, 10),
    description: body.data.description,
    provider: body.data.provider ?? null,
    location: body.data.location ?? null,
    medications: body.data.medications ?? [],
    tags: body.data.tags ?? [],
    followUp: body.data.followUp ?? null,
  }).returning();
  res.status(201).json(CreateEventResponse.parse(eventView(event)));
});

router.patch("/events/:eventId", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  const body = UpdateEventBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates = {
    ...body.data,
    date: body.data.date ? body.data.date.toISOString().slice(0, 10) : undefined,
    provider: body.data.provider ?? undefined,
    location: body.data.location ?? undefined,
    medications: body.data.medications ?? undefined,
    tags: body.data.tags ?? undefined,
    followUp: body.data.followUp ?? undefined,
  };
  const [event] = await db.update(healthEventsTable).set(updates).where(eq(healthEventsTable.id, params.data.eventId)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(UpdateEventResponse.parse(eventView(event)));
});

router.delete("/events/:eventId", async (req, res): Promise<void> => {
  const parsed = DeleteEventParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.delete(healthEventsTable).where(eq(healthEventsTable.id, parsed.data.eventId)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/reminders", async (_req, res): Promise<void> => {
  const reminders = await db.select().from(remindersTable).orderBy(asc(remindersTable.date));
  res.json(ListRemindersResponse.parse(reminders.map(reminderView)));
});

router.post("/reminders", async (req, res): Promise<void> => {
  const parsed = CreateReminderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [reminder] = await db.insert(remindersTable).values({
    profileId: parsed.data.profileId,
    title: parsed.data.title,
    date: parsed.data.date.toISOString().slice(0, 10),
    detail: parsed.data.detail,
    completed: false,
  }).returning();
  res.status(201).json(CreateReminderResponse.parse(reminderView(reminder)));
});

router.patch("/reminders/:reminderId/complete", async (req, res): Promise<void> => {
  const parsed = CompleteReminderParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [reminder] = await db.update(remindersTable).set({ completed: true }).where(eq(remindersTable.id, parsed.data.reminderId)).returning();
  if (!reminder) {
    res.status(404).json({ error: "Reminder not found" });
    return;
  }
  res.json(CompleteReminderResponse.parse(reminderView(reminder)));
});

router.get("/profiles/:profileId/summary", async (req, res): Promise<void> => {
  const parsed = GetProfileSummaryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, parsed.data.profileId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const events = await db.select().from(healthEventsTable).where(eq(healthEventsTable.profileId, profile.id)).orderBy(desc(healthEventsTable.date));
  const summary = {
    profile: profileView(profile, events),
    generatedAt: new Date(),
    overview: `${profile.name}'s health history includes ${events.length} recorded ${events.length === 1 ? "event" : "events"} across visits, symptoms, treatments, and tests.`,
    keyConditions: events.filter((event) => event.type === "diagnosis").map((event) => event.title),
    currentMedications: Array.from(new Set(events.flatMap((event) => event.medications ?? []))),
    recentTests: events.filter((event) => event.type === "test").slice(0, 4).map((event) => `${event.title} — ${event.date}`),
    recentVisits: events.filter((event) => event.type === "visit").slice(0, 4).map((event) => `${event.title} — ${event.date}`),
  };
  res.json(GetProfileSummaryResponse.parse(summary));
});

export default router;