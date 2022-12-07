package ch.zhaw.powerpuff.powerpuff.model.aggregation;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class ProductByProducttypeAggregationDTO {
    private String id;
    private List<String> productIds;
    private String totalPrices;
    
}
