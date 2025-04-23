import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActionArea, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <Card sx={{ height: '100%', width: "100%", display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={handleClick} sx={{ display: 'flex', flexDirection: 'row', height: '100%', alignItems: 'stretch' }}>
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

                <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" component="div" fontWeight="bold">
                            {product.brand}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {product.model}
                        </Typography>
                    </CardContent>

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