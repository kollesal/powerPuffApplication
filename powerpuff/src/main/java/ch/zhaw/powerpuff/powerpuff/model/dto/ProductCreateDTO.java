package ch.zhaw.powerpuff.powerpuff.model.dto;
import ch.zhaw.powerpuff.powerpuff.model.types.ClothingType;
import ch.zhaw.powerpuff.powerpuff.model.types.DifficultyType;
import ch.zhaw.powerpuff.powerpuff.model.types.ProductType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@RequiredArgsConstructor
@Setter
@Getter
public class ProductCreateDTO {
    
    @NonNull
    private DifficultyType difficultyType;
    @NonNull
    private ProductType productType;
    @NonNull
    private ClothingType clothingType;
    @NonNull
    private String productname;
    @NonNull
    private String description;
    @NonNull
    private String size;
    @NonNull
    private Double price;
    @NonNull
    private String patchart;

}
