const Activity = require("../models/activity.model");

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AR";

const createActivity = async ({
  userId,
  actorName,
  type,
  targetName,
  targetContact,
  description,
  statusFrom,
  statusTo,
  noteContent
}) => {
  return Activity.create({
    user: userId,
    type,
    actorName,
    actorInitials: getInitials(actorName),
    targetName,
    targetContact,
    description,
    statusFrom,
    statusTo,
    noteContent
  });
};

module.exports = {
  createActivity
};
