import React from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
    Popover
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../../redux/slices/cartSlice';

const CartDropdown = ({ anchorEl, open, handleClose }) => {
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.cart.items);

    const handleRemoveItem = (index, event) => {
        event.stopPropagation();
        dispatch(removeFromCart(index));
    };

    const handleClearCart = (event) => {
        event.stopPropagation();
        dispatch(clearCart());
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

                {cartItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                        Tu carrito está vacío
                    </Typography>
                ) : (
                    <>
                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {cartItems.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ListItem
                                        secondaryAction={
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={(e) => handleRemoveItem(index, e)}
                                            >
                                                Eliminar
                                            </Button>
                                        }
                                    >
                                        <ListItemText
                                            primary={`ID: ${item.id}`}
                                            secondary={`Color: ${item.colorCode}, Almacenamiento: ${item.storageCode}`}
                                        />
                                    </ListItem>
                                    {index < cartItems.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>

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