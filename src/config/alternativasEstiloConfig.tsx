export const estilosAlternativa = [
    {   className: "itemPLight",
        bg: "brand.primaryLight",
        color: "brand.primaryDark",
        borderColor:"transparent",
        transition: "all 0.2s ease", 
        hover: {
          fontStyle: "navigationAction",
          bg: "#2f9e411f",
          color: "brand.neutral",
        },
        focusVisible: {
          outline: "2px solid",
          outlineOffset: "2px",
          outlineColor: "brand.secondary",
        },
    }, {   
        className: "itemPDark",
        bg: "brand.primaryDark",
        color: "brand.white",
        borderColor:"transparent",
        transition: "all 0.2s ease", 
        hover: {
            bg: "brand.secondary",
        },
        focusVisible: {
            outline: "3px solid",
            outlineColor: "brand.neutral",
        },
    }, {   
        className: "itemSecondary",
        bg: "brand.secondary",
        color: "brand.white",
        borderColor:"transparent",
        transition: "all 0.2s ease", 
        hover: {
          fontStyle: "navigationAction",
          bg: "#1b741f"
        },
        focusVisible: {
          outline: "2px solid",
          outlineOffset: "2px",
          outlineColor: "brand.secondary",
        },
    }, {   
        className: "itemWhite",
        bg: "brand.white",
        color: "brand.neutral",
        borderColor: "brand.neutral",
        transition: "all 0.2s ease", 
        hover: {
          fontStyle: "navigationAction",
          borderColor: "brand.primaryDark",
          borderWidth:"1px",
          color: "brand.primaryDark",
          bg: "#2f9e411f",
        },
        focusVisible: {
          outline: "3px solid",
          outlineColor: "brand.neutral",
        },
    }
]
