package com.example.faishion.report;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/report")
public class ReportController {
    private final ReportService reportService;

    @PostMapping("/isReported")
    public boolean isReported(@RequestBody ReportDTO reportDTO){
        Report report = new Report();
        report.setDescription(reportDTO.getDescription());

        return true;
    }
}
