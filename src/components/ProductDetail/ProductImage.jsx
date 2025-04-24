import React from 'react'

const ProductImage = ({ product }) => {
    return (
        <img
            alt={`${product.brand} - ${product.model}`}
            src={product.imgUrl}
            loading='lazy'
            style={{
                maxWidth: '100%',
                height: "50%",
                objectFit: 'contain'
            }}
        />
    )
}

export default ProductImage