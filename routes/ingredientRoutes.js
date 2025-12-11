// backend/routes/ingredientRoutes.js
const express = require('express');
const router = express.Router();
const IngredientController = require('../controllers/ingredientController');

router.post('/', IngredientController.createIngredient);
router.get('/', IngredientController.getAllIngredients);
router.get('/:id', IngredientController.getIngredientById);
router.put('/:id', IngredientController.updateIngredient);
router.delete('/:id', IngredientController.deleteIngredient);

// get ingredients by product
router.get('/product/:productId', IngredientController.getByProduct);

module.exports = router;
