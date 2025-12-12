package com.assignment.sweet.controller;

import com.assignment.sweet.model.Sweet;
import com.assignment.sweet.service.SweetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sweets")
public class SweetController {

    private final SweetService sweetService;

    public SweetController(SweetService sweetService) {
        this.sweetService = sweetService;
    }

    @GetMapping
    public ResponseEntity<List<Sweet>> getAllSweets() {
        return ResponseEntity.ok(sweetService.getAllSweets());
    }

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Sweet> addSweet(
            @RequestPart("sweet") Sweet sweet,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        return ResponseEntity.ok(sweetService.addSweet(sweet, image));
    }

    @PostMapping("/{id}/purchase")
    public ResponseEntity<Sweet> purchaseSweet(@PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(sweetService.purchaseSweet(id, email));
    }

    @PostMapping("/{id}/restock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Sweet> restockSweet(@PathVariable Long id, @RequestBody Integer quantity) {
        return ResponseEntity.ok(sweetService.restockSweet(id, quantity));
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Sweet> updateSweet(
            @PathVariable Long id,
            @RequestPart("sweet") Sweet sweet,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        return ResponseEntity.ok(sweetService.updateSweet(id, sweet, image));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSweet(@PathVariable Long id) {
        sweetService.deleteSweet(id);
        return ResponseEntity.noContent().build();
    }
}
