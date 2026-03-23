package com.expensetracker.service.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String askGemini(String prompt) {
        try {
            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.0-flash",
                            prompt,
                            null
                    );

            String text = response.text();
            System.out.println("DEBUG: Gemini Response Received (" + text.length() + " chars)");
            return text;
        } catch (Exception e) {
            System.err.println("ERROR: Gemini Call Failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}