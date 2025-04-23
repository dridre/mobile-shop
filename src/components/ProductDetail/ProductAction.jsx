import React, { useState } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';


const ProductAction = ({ product }) => {

    const dispatch = useDispatch();

    const [selectedStorage, setSelectedStorage] = useState(
        product?.options?.storages?.[0]?.code?.toString() || ''
    );
    const [selectedColor, setSelectedColor] = useState(
        product?.options?.colors?.[0]?.code?.toString() || ''
    );

    const handleStorageChange = (event) => {
        setSelectedStorage(event.target.value);
    };

    const handleColorChange = (event) => {
        setSelectedColor(event.target.value);
    };

    const addCart = () => {

        dispatch(addToCart({
            product,
            colorCode: selectedColor,
            storageCode: selectedStorage
        }));
    };

    return (
        <Box sx={{ width: "80%" }} display={"flex"} flexDirection={"column"} alignItems={"center"}>
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
                    onClick={() => addCart()}
                >
                    Añadir al carrito
                </Button>
            </Box>
        </Box>
    );
};

export default ProductAction;