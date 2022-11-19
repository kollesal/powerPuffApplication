package ch.zhaw.powerpuff.powerpuff.model;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class ProductCreateDTO {
    
    private DifficultyType difficultyType;
    private String productname;
    private String description;
    private String size;
    private String clothingType;
    private double prize;
    private String patchArt;
    
}
