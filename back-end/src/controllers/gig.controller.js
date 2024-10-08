import { Gig } from "../models/gig.model.js";
import { apiError } from "../utils/apiError.js";

export const createGig = async (req, res, next) => {
  if (!res.isSeller)
    return next(apiError(403, "Only sellers can create a gig!"));

  const newGig = new Gig({
    userId: req.userId,
    ...req.body,
  });

  try {
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (error) {
    next(error);
  }
};

export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (gig.userId !== req.userId)
      return next(apiError(403, "you can delete only your gig!"));

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (error) {
    next(error);
  }
};
export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return next(apiError(404, "Gig not Found"));

    res.status(200).send(gig);
  } catch (error) {
    next(error);
  }
};

export const getGigs = async (req, res, next) => {
  const q = req.query;

  const filters = {
    ...(q.userId && { userId: q.userId }),
    ...(q.category && { category: q.category }),
    ...((q.min || q.max) && {
      price: {...(q.min && {$gt: q.min}),
    ...(q.max && { $lt: q.max })}}),
    ...(q.search && {
      title: { $regex: q.search, $options: "i" },
    }),
  };

  try {
    const gigs = await Gig.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(gigs);
  } catch (error) {
    next(error);
  }
};
