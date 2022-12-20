package ch.zhaw.powerpuff.powerpuff.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EmailValidationDTO {

    public String status;
    public String email_address;
    public String domain;
    public boolean deliverable;
    
}
