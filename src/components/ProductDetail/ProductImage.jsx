import { Box } from '@mui/material'
import React from 'react'

const ProductImage = ({ product }) => {
    return (
        <img
            alt={`${product.brand} - ${product.model}`}
            src={product.imgUrl}
            loading='lazy'
        />
    )
}

export default ProductImage