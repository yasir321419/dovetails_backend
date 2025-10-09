const prisma = require("../../config/prismaConfig");
const { ConflictError, ValidationError, NotFoundError } = require("../../handler/CustomError");
const { handlerOk } = require("../../handler/resHandler");

const createCategory = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { name } = req.body;

    const findcategory = await prisma.category.findFirst({
      where: {
        name
      }
    });

    if (findcategory) {
      throw new ConflictError("category already exist")
    }

    const createcategory = await prisma.category.create({
      data: {
        name,
        adminId: id
      }
    });

    if (!createcategory) {
      throw new ValidationError("category not create")
    }

    handlerOk(res, 200, createcategory, "caterogy created succesfully")

  } catch (error) {
    next(error)
  }
}

const showCategory = async (req, res, next) => {
  try {
    const findcategroy = await prisma.category.findMany({});

    if (findcategroy.length === 0) {
      throw new NotFoundError("category not found")
    }

    handlerOk(res, 200, findcategroy, "category found successfully")
  } catch (error) {
    next(error)

  }
}

const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const findcategory = await prisma.category.findUnique({
      where: {
        id: categoryId
      }
    });

    if (!findcategory) {
      throw new NotFoundError("category not found")
    }

    const updatecategory = await prisma.category.update({
      where: {
        id: findcategory.id
      },
      data: {
        name
      }
    });

    if (!updatecategory) {
      throw new ValidationError("category not update")
    }

    handlerOk(res, 200, updatecategory, "category updated successfully");


  } catch (error) {
    next(error)

  }
}

const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const findcategory = await prisma.category.findUnique({
      where: {
        id: categoryId
      }
    });

    if (!findcategory) {
      throw new NotFoundError("category not found")
    }

    await prisma.category.delete({
      where: {
        id: findcategory.id
      }
    });

    handlerOk(res, 200, null, "category deleted succesfully");

  } catch (error) {
    next(error)

  }
}

module.exports = {
  createCategory,
  showCategory,
  updateCategory,
  deleteCategory
}
