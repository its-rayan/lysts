import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '@/logger';
import { addBooksToCollectionSchema, createCollectionSchema } from './schemas';
import Collection from '@/database/models/collection';

export const getCollections = async (req: Request, res: Response) => {
  try {
    const collections = await Collection.find();
    res.json({
      status: 'success',
      data: collections
    });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      error
    });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const model = { ...req.body };

    // validate request body
    const validity = createCollectionSchema.safeParse(model);
    if (!validity.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        error: validity.error.format()
      });
      return;
    }

    const foundCollection = await Collection.findOne({
      name: model.name,
      userId: model.userId
    });
    if (foundCollection) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        error: 'Collection already exists'
      });
      return;
    }

    const collection = new Collection(model);
    await collection.save();

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: collection
    });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      error
    });
  }
};

export const getCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id).populate({
      path: 'userId',
      select: 'username'
    });
    if (!collection) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: 'error',
        error: 'Collection not found'
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: collection
    });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      error
    });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Collection.findByIdAndDelete(id);
    res.status(StatusCodes.NO_CONTENT).json();
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      error
    });
  }
};

export const addBooksToCollection = async (req: Request, res: Response) => {
  try {
    const { id: collectionId } = req.params;
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: 'error',
        error: 'Collection not found'
      });
      return;
    }

    // validate request body
    const { books } = req.body;
    const validity = addBooksToCollectionSchema.safeParse(books);
    if (!validity.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        error: validity.error.format()
      });
      return;
    }

    collection.books.push(...books);
    await collection.save();
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: collection
    });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      error
    });
  }
};
