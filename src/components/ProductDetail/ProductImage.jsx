import { Box } from '@mui/material'
import React from 'react'

const ProductImage = ({ product }) => {
    return (
        <Box
            component="img"
            alt={`${product.brand} - ${product.model}`}
            src={product.imgUrl}
            sx={{
                width: '100%',
                height: 'auto',
                maxWidth: '50%'
            }}
        />
    )
}

export default ProductImage