import React, { useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
    Popover,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector, useDispatch } from 'react-redux';
import { clearCartItems, removeCartItem, initializeCart } from '../../redux/slices/cartSlice';


const CartDropdown = ({ anchorEl, open, handleClose }) => {
    const dispatch = useDispatch();

    // Obtiene los items del carrito del estado de Redux
    const cartItems = useSelector(state => state.cart.items);

    // Inicializa el carrito cuando se abre el dropdown
    useEffect(() => {
        if (open) {
            dispatch(initializeCart());
        }
    }, [open, dispatch]);

    // Función para eliminar un item específico del carrito
    const handleRemoveItem = (index, event) => {
        event.stopPropagation();
        dispatch(removeCartItem(index));
    };

    // Función para vaciar todo el carrito
    const handleClearCart = (event) => {
        event.stopPropagation();
        dispatch(clearCartItems());
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <Paper sx={{ minWidth: 300, maxWidth: 400, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Carrito de Compras
                </Typography>

                {/* Muestra mensaje si el carrito está vacío */}
                {cartItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                        Tu carrito está vacío
                    </Typography>
                ) : (
                    <>
                        {/* Lista de productos en el carrito */}
                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {cartItems.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => handleRemoveItem(index, e)}
                                                edge="end"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        {/* Miniatura del producto */}
                                        <Box
                                            sx={{
                                                mr: 2,
                                                width: 50,
                                                height: 50,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <img
                                                src={item.img}
                                                alt={item.model}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </Box>
                                        {/* Información del producto */}
                                        <ListItemText
                                            primary={`${item.brand} - ${item.model}`}
                                            secondary={`Color: ${item.colorCode}, Almacenamiento: ${item.storageCode}`}
                                        />
                                    </ListItem>
                                    {index < cartItems.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>

                        {/* Botón para vaciar el carrito */}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                size="small"
                                color="error"
                                onClick={handleClearCart}
                            >
                                Vaciar
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Popover>
    );
};

export default CartDropdown;