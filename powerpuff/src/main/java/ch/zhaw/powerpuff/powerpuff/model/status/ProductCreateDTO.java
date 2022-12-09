package ch.zhaw.powerpuff.powerpuff.model.status;
import ch.zhaw.powerpuff.powerpuff.model.ClothingType;
import ch.zhaw.powerpuff.powerpuff.model.DifficultyType;
import ch.zhaw.powerpuff.powerpuff.model.ProductType;
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
    
}
