import com.google.genai.Client;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;

public class InspectClient {
    public static void main(String[] args) {
        try {
            Class<?> clazz = Client.class;
            System.out.println("Class: " + clazz.getName());
            
            System.out.println("\nConstructors:");
            for (Constructor<?> c : clazz.getConstructors()) {
                System.out.println(c);
            }
            
            System.out.println("\nMethods:");
            for (Method m : clazz.getMethods()) {
                if (m.getName().toLowerCase().contains("builder") || m.getName().toLowerCase().contains("create") || m.getName().toLowerCase().contains("config")) {
                    System.out.println(m);
                }
            }
            
            // Try to find Config class
            try {
                Class<?> configClazz = Class.forName("com.google.genai.Config");
                System.out.println("\nConfig Class found: " + configClazz.getName());
            } catch (Exception e) {
                System.out.println("\nConfig Class NOT found in com.google.genai");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
