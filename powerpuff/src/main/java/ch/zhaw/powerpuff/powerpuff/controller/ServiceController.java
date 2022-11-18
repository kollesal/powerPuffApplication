package ch.zhaw.powerpuff.powerpuff.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.powerpuff.powerpuff.service.UtilityService;

@RestController
@RequestMapping("/api/service")
public class ServiceController {


    @Autowired
    UtilityService utilityService;
/*
    @PostMapping("/jobassignment")
    public ResponseEntity<Job> assignJob(
        @RequestBody JobAssignDTO assignDTO) {
        //Service aufrufen. Falls die Zuweisung erfolgreich war 

        if (assignDTO!=null){
            Optional<Job> newService = jobService.assignJob(assignDTO.getJobId(), assignDTO.getFreelancerId());

            //den modifizierten Job mit Status OK zurückgeben, sonst BAD_REQUEST return new
            return new ResponseEntity<>(newService.get(), HttpStatus.OK);
        }
        
        //ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/jobcompletion")
    public ResponseEntity<Job> closeJob(
        @RequestBody JobCloseDTO closeDTO) {
        //Service aufrufen. Falls die Zuweisung erfolgreich war

        if (closeDTO!=null){
            Optional<Job> Service = jobService.closeJob(closeDTO.getJobId(), closeDTO.getComment());

            //den modifizierten Job mit Status OK zurückgeben, sonst BAD_REQUEST return new
            return new ResponseEntity<>(Service.get(), HttpStatus.OK);
        }
        
        //ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
       */ 
}
