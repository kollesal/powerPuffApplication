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

    @NonNull
    private DifficultyType difficultyType;
    @NonNull
    private ProductState productState = ProductState.NEW;
    @NonNull
    private ProductType productType = ProductType.SCHNITTMUSTER;
    @NonNull
    private String productname;
    @NonNull
    private String description;
    @NonNull
    private String size;
    @NonNull
    private ClothingType clothingType = ClothingType.UNDEFINED;
    
    private double prize;
    @NonNull
    private String patchArt;

}
