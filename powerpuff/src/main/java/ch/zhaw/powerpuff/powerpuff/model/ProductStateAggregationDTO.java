package ch.zhaw.powerpuff.powerpuff.model;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class ProductStateAggregationDTO {
    private String id;
    private List<String> productIds;
    private String count;    
}
