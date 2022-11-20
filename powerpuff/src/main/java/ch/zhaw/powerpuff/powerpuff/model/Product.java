package ch.zhaw.powerpuff.powerpuff.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.lang.NonNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@NoArgsConstructor
@Document("products")
public class Product {
   
    @Id
    private String id;

    
    private DifficultyType difficultyType;
    @NonNull
    private ProductState productState = ProductState.NEW;
    
    private ProductType productType;

    private ClothingType clothingType;
    @NonNull
    private String productname;
    @NonNull
    private String description;
    @NonNull
    private String size;
    

    private double prize;
    @NonNull
    private String patchart;

    public Product (DifficultyType difficultyType, ClothingType clothingType, ProductType productType, String productname, String description, String size, String patchart, Double prize){
        this.difficultyType = difficultyType;
        this.clothingType  = clothingType;
        this.productType = productType;
        this.productname = productname;
        this.description = description;
        this.size = size;
        this.prize = prize;
        this.patchart = patchart;

    }
}
