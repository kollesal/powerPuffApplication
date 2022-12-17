package ch.zhaw.powerpuff.powerpuff.model;

import java.util.ArrayList;
import java.util.List;

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
    
    private double price;

    @NonNull
    private String patchart;

    private String userId;
    public List<String> utilityIds = new ArrayList<>();

    private String comment;

    public Product (DifficultyType difficultyType, ClothingType clothingType, ProductType productType, String productname, String description, String size, String patchart, Double price){
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
