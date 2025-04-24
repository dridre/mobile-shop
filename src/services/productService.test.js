import axios from 'axios';
import ProductCache from '../utils/productCache.js';
import ProductService from './productService.js';

jest.mock('axios', () => ({
    get: jest.fn(),
}));

jest.mock('../utils/productCache.js', () => ({
    init: jest.fn(),
    getProductsList: jest.fn(),
    saveProductsList: jest.fn(),
    getProductDetails: jest.fn(),
    saveProductDetails: jest.fn(),
    clearAllProductsCache: jest.fn(),
}));

const MOCK_PRODUCTS_LIST = [
    {
        id: 1,
        brand: 'Apple',
        model: 'iPhone 12',
        price: 999,
        imgUrl: 'iphone12.jpg',
        cpu: 'A14 Bionic',
        ram: 4,
        os: 'iOS 14',
        displayResolution: '1170 x 2532',
        battery: '2815 mAh',
        primaryCamera: '12 MP',
        secondaryCamera: '12 MP',
        dimentions: '146.7 x 71.5 x 7.4 mm',
        weight: 164,
        colors: ['Black', 'White', 'Red'],
        storage: ['64GB', '128GB', '256GB']
    },
    {
        id: 2,
        brand: 'Samsung',
        model: 'Galaxy S21',
        price: 899,
        imgUrl: 'galaxys21.jpg',
        cpu: 'Exynos 2100',
        ram: 8,
        os: 'Android 11',
        displayResolution: '1080 x 2400',
        battery: '4000 mAh',
        primaryCamera: '64 MP',
        secondaryCamera: '10 MP',
        dimentions: '151.7 x 71.2 x 7.9 mm',
        weight: 171,
        colors: ['Phantom Gray', 'Phantom White', 'Phantom Violet'],
        storage: ['128GB', '256GB']
    }
];

const MOCK_PRODUCT_DETAIL = {
    id: 1,
    brand: 'Apple',
    model: 'iPhone 12',
    price: 999,
    imgUrl: 'iphone12.jpg',
    cpu: 'A14 Bionic',
    ram: 4,
    os: 'iOS 14',
    displayResolution: '1170 x 2532',
    battery: '2815 mAh',
    primaryCamera: '12 MP',
    secondaryCamera: '12 MP',
    dimentions: '146.7 x 71.5 x 7.4 mm',
    weight: 164,
    options: {
        colors: [
            { code: 1000, name: 'Black' },
            { code: 1001, name: 'White' },
            { code: 1002, name: 'Red' }
        ],
        storages: [
            { code: 2000, name: '64 GB' },
            { code: 2001, name: '128 GB' },
            { code: 2002, name: '256 GB' }
        ]
    }
};

describe('ProductService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('init', () => {
        it('should initialize the ProductCache', async () => {
            await ProductService.init();
            expect(ProductCache.init).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAllProducts', () => {
        it('should return cached products when available', async () => {
            ProductCache.getProductsList.mockResolvedValue(MOCK_PRODUCTS_LIST);

            const result = await ProductService.getAllProducts();

            expect(result).toEqual(MOCK_PRODUCTS_LIST);
            expect(ProductCache.getProductsList).toHaveBeenCalledTimes(1);
            expect(axios.get).not.toHaveBeenCalled();
            expect(ProductCache.saveProductsList).not.toHaveBeenCalled();
        });

        it('should fetch from API and cache when no cached products', async () => {
            ProductCache.getProductsList.mockResolvedValue(null);
            axios.get.mockResolvedValue({ data: MOCK_PRODUCTS_LIST });

            const result = await ProductService.getAllProducts();

            expect(result).toEqual(MOCK_PRODUCTS_LIST);
            expect(ProductCache.getProductsList).toHaveBeenCalledTimes(1);
            expect(axios.get).toHaveBeenCalledWith('https://itx-frontend-test.onrender.com/api/product');
            expect(ProductCache.saveProductsList).toHaveBeenCalledWith(MOCK_PRODUCTS_LIST);
        });

        it('should throw error when API call fails', async () => {
            ProductCache.getProductsList.mockResolvedValue(null);
            const mockError = new Error('API error');
            axios.get.mockRejectedValue(mockError);

            await expect(ProductService.getAllProducts()).rejects.toThrow(mockError);
        });
    });

    describe('getProductById', () => {
        const productId = 1;

        it('should return cached product when available (with CPU info)', async () => {
            ProductCache.getProductDetails.mockResolvedValue(MOCK_PRODUCT_DETAIL);

            const result = await ProductService.getProductById(productId);

            expect(result).toEqual(MOCK_PRODUCT_DETAIL);
            expect(ProductCache.getProductDetails).toHaveBeenCalledWith(productId);
            expect(axios.get).not.toHaveBeenCalled();
            expect(ProductCache.saveProductDetails).not.toHaveBeenCalled();
        });

        it('should fetch from API and cache when no cached product', async () => {
            ProductCache.getProductDetails.mockResolvedValue({ id: productId });
            axios.get.mockResolvedValue({ data: MOCK_PRODUCT_DETAIL });

            const result = await ProductService.getProductById(productId);

            expect(result).toEqual(MOCK_PRODUCT_DETAIL);
            expect(ProductCache.getProductDetails).toHaveBeenCalledWith(productId);
            expect(axios.get).toHaveBeenCalledWith(`https://itx-frontend-test.onrender.com/api/product/${productId}`);
            expect(ProductCache.saveProductDetails).toHaveBeenCalledWith(productId, MOCK_PRODUCT_DETAIL);
        });

        it('should throw error when API call fails', async () => {
            ProductCache.getProductDetails.mockResolvedValue({ id: productId });
            const mockError = new Error('API error');
            axios.get.mockRejectedValue(mockError);

            await expect(ProductService.getProductById(productId)).rejects.toThrow(mockError);
        });
    });

    describe('clearProductsCache', () => {
        it('should clear products cache', async () => {
            ProductCache.clearAllProductsCache.mockResolvedValue(true);

            const result = await ProductService.clearProductsCache();

            expect(result).toBe(true);
            expect(ProductCache.clearAllProductsCache).toHaveBeenCalledTimes(1);
        });

    });
});