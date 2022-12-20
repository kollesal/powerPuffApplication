package ch.zhaw.powerpuff.powerpuff.model.dto;
import ch.zhaw.powerpuff.powerpuff.model.types.ClothingType;
import ch.zhaw.powerpuff.powerpuff.model.types.DifficultyType;
import ch.zhaw.powerpuff.powerpuff.model.types.ProductType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class ProductCreateDTO {
    
    private DifficultyType difficultyType;
    private ProductType productType;
    private ClothingType clothingType;
    private String productname;
    private String description;
    private String size;
    private double price;
    private String patchart;


    public ProductCreateDTO (DifficultyType difficultyType, ClothingType clothingType, ProductType productType, String productname, String description, String size, String patchart, Double price){
        this.difficultyType = difficultyType;
        this.clothingType  = clothingType;
        this.productType = productType;
        this.productname = productname;
        this.description = description;
        this.size = size;
        this.price = price;
        this.patchart = patchart;
 
    }

}
