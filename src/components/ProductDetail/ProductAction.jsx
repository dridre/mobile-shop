import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductAction = ({ product }) => {
    const dispatch = useDispatch();
    const { status, error } = useSelector(state => state.cart);

    const [selectedStorage, setSelectedStorage] = useState(
        product?.options?.storages?.[0]?.code?.toString() || ''
    );
    const [selectedColor, setSelectedColor] = useState(
        product?.options?.colors?.[0]?.code?.toString() || ''
    );

    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (status === 'succeeded' && isAdding) {
            toast.success('Producto agregado al carrito', {
                position: "bottom-left",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            setIsAdding(false);
        }

        if (status === 'failed' && error && isAdding) {

            toast.error(`Producto ya en el carrito`, {
                position: "bottom-left",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });

            setIsAdding(false);
        }
    }, [status, error, isAdding]);

    const handleStorageChange = (event) => {
        setSelectedStorage(event.target.value);
    };

    const handleColorChange = (event) => {
        setSelectedColor(event.target.value);
    };

    const addCart = () => {
        setIsAdding(true);
        dispatch(addToCart({
            product,
            colorCode: selectedColor,
            storageCode: selectedStorage
        }));
    };

    return (
        <Box sx={{ width: "80%" }} display={"flex"} flexDirection={"column"} alignItems={"center"}>
            <ToastContainer
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <FormControl sx={{ mb: 3, width: '200px' }} size="small">
                <InputLabel id="storage-select-label">Storage</InputLabel>
                <Select
                    labelId="storage-select-label"
                    id="storage-select"
                    value={selectedStorage}
                    label="Storage"
                    onChange={handleStorageChange}
                >
                    {product?.options?.storages?.map((storage) => (
                        <MenuItem key={storage.code} value={storage.code.toString()}>
                            {storage.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ mb: 4, width: '200px' }} size="small">
                <InputLabel id="color-select-label">Color</InputLabel>
                <Select
                    labelId="color-select-label"
                    id="color-select"
                    value={selectedColor}
                    label="Color"
                    onChange={handleColorChange}
                >
                    {product?.options?.colors?.map((color) => (
                        <MenuItem key={color.code} value={color.code.toString()}>
                            {color.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCartIcon />}
                    sx={{ px: 4, py: 1.5 }}
                    size="medium"
                    disabled={status === isAdding}
                    onClick={addCart}
                >
                    {status === isAdding ? 'Añadiendo...' : 'Añadir al carrito'}
                </Button>
            </Box>
        </Box>
    );
};

export default ProductAction;