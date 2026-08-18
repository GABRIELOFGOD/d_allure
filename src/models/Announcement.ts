import { Schema, models, model } from "mongoose";

export interface IAnnouncement {
  _id: string;
  text: string;
  active: boolean;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    text: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Announcement || model<IAnnouncement>("Announcement", AnnouncementSchema);
