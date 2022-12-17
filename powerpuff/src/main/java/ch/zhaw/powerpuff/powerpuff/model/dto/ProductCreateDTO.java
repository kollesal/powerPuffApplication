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

    public DifficultyType getDifficultyType() {
        return difficultyType;
    }

    public ProductType getProductType() {
        return productType;
    }

    public ClothingType getClothingType() {
        return clothingType;
    }

    public String getProductname() {
        return productname;
    }

    public String getDescription() {
        return description;
    }

    public String getSize() {
        return size;
    }

    public Double getPrice() {
        return price;
    }

    public String getPatchart() {
        return patchart;
    }

    public void setDifficultyType(DifficultyType difficultyType) {
        this.difficultyType = difficultyType;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
    }

    public void setClothingType(ClothingType clothingType) {
        this.clothingType = clothingType;
    }

    public void setProductname(String productname) {
        this.productname = productname;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setPatchart(String patchart) {
        this.patchart = patchart;
    }


}
