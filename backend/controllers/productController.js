import Product from '../models/Product.js';

// GET all products or filter by category
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    
    console.log(`[API] Fetching products with filter:`, filter);
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('[API Error] fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products', error: error.message });
  }
};

// GET a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product', error: error.message });
  }
};

// POST a new product (Admin only logic on frontend, but open here for simplicity in this iteration)
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;
    
    if (!name || !category || !price || !description || !image) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      description,
      image
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
};

// PUT update an existing product by ID
export const updateProduct = async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;

    if (!name || !category || !price || !description || !image) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        price: Number(price),
        description,
        image
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
};

// DELETE a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
};
