import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, CardActionArea, Box, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    // Estado para controlar el efecto hover
    const [isHovered, setIsHovered] = useState(false);

    // Configuración responsive
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Función para navegar al detalle del producto
    const handleClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <Card
            sx={{
                height: '100%',
                width: "100%",
                display: 'flex',
                flexDirection: 'column',
                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'all 0.3s ease',
                boxShadow: isMobile || isHovered ? (isHovered ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)') : 'none',
                backgroundColor: isMobile || isHovered ? undefined : 'transparent',
                border: isMobile || isHovered ? undefined : 'none',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardActionArea
                onClick={handleClick}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    height: '100%',
                    alignItems: 'stretch'
                }}
            >
                {/* Contenedor de la imagen del producto */}
                <Box sx={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardMedia
                        component="img"
                        image={product.imgUrl}
                        alt={`${product.brand} ${product.model}`}
                        sx={{
                            objectFit: 'contain',
                            p: 2,
                            height: '100%',
                            width: '100%',
                            maxHeight: 200
                        }}
                    />
                </Box>

                {/* Contenedor de la información del producto */}
                <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" component="div" fontWeight="bold">
                            {product.brand}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {product.model}
                        </Typography>
                    </CardContent>

                    {/* Precio del producto */}
                    <CardContent sx={{ pt: 0 }}>
                        <Typography variant="h6" color="primary" sx={{ textAlign: 'right' }}>
                            {product.price ? `${product.price}€` : '--€'}
                        </Typography>
                    </CardContent>
                </Box>
            </CardActionArea>
        </Card>
    );
};

export default ProductCard;