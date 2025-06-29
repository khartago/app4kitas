import 'package:flutter/material.dart';

// Design tokens from styles_app4kitas_MODERN.json
class App4KitasTheme {
  // Colors
  static const Color primary = Color(0xFF4CAF50);
  static const Color primaryDark = Color(0xFF388E3C);
  static const Color accent = Color(0xFFFFC107);
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color error = Color(0xFFF44336);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color border = Color(0xFFE0E0E0);
  static const Color disabled = Color(0xFFBDBDBD);

  // Dark mode colors
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkTextPrimary = Color(0xFFE0E0E0);
  static const Color darkTextSecondary = Color(0xFFBDBDBD);

  // Typography
  static const String fontFamily = 'Inter';

  static TextTheme textTheme = const TextTheme(
    displayLarge: TextStyle(
      fontSize: 32,
      fontWeight: FontWeight.bold,
      fontFamily: fontFamily,
      color: textPrimary,
    ),
    displayMedium: TextStyle(
      fontSize: 24,
      fontWeight: FontWeight.bold,
      fontFamily: fontFamily,
      color: textPrimary,
    ),
    titleMedium: TextStyle(
      fontSize: 18,
      fontWeight: FontWeight.w600,
      fontFamily: fontFamily,
      color: textPrimary,
    ),
    bodyLarge: TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.normal,
      fontFamily: fontFamily,
      color: textPrimary,
    ),
    bodyMedium: TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.normal,
      fontFamily: fontFamily,
      color: textSecondary,
    ),
    bodySmall: TextStyle(
      fontSize: 12,
      fontWeight: FontWeight.normal,
      fontFamily: fontFamily,
      color: textSecondary,
    ),
  );

  // Button Style
  static final ButtonStyle elevatedButtonStyle = ElevatedButton.styleFrom(
    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
    backgroundColor: primary,
    foregroundColor: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    elevation: 2,
    textStyle: const TextStyle(
      fontFamily: fontFamily,
      fontWeight: FontWeight.w600,
      fontSize: 16,
    ),
  );

  // Card Theme
  static final CardTheme cardTheme = CardTheme(
    color: surface,
    margin: const EdgeInsets.all(8),
    elevation: 1,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
    ),
  );

  // Input Decoration Theme
  static final InputDecorationTheme inputDecorationTheme = InputDecorationTheme(
    contentPadding: const EdgeInsets.all(12),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: primary),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: error),
    ),
    disabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: disabled),
    ),
    hintStyle: const TextStyle(color: textSecondary),
    labelStyle: const TextStyle(color: textPrimary),
  );

  // Snackbar Theme
  static final SnackBarThemeData snackBarTheme = SnackBarThemeData(
    backgroundColor: const Color(0xFF323232),
    contentTextStyle: const TextStyle(
      color: Colors.white,
      fontFamily: fontFamily,
      fontSize: 14,
    ),
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
    ),
  );

  // Avatar size
  static const double avatarSize = 48;

  // Dialog Theme
  static final DialogTheme dialogTheme = DialogTheme(
    backgroundColor: surface,
    titleTextStyle: const TextStyle(
      color: textPrimary,
      fontFamily: fontFamily,
      fontWeight: FontWeight.bold,
      fontSize: 20,
    ),
    contentTextStyle: const TextStyle(
      color: textPrimary,
      fontFamily: fontFamily,
      fontSize: 16,
    ),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
    ),
  );

  // Light ThemeData
  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    primaryColor: primary,
    colorScheme: ColorScheme.light(
      primary: primary,
      secondary: accent,
      background: background,
      surface: surface,
      error: error,
      onPrimary: Colors.white,
      onSecondary: Colors.black,
      onBackground: textPrimary,
      onSurface: textPrimary,
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: background,
    textTheme: textTheme,
    fontFamily: fontFamily,
    elevatedButtonTheme: ElevatedButtonThemeData(style: elevatedButtonStyle),
    cardTheme: cardTheme,
    inputDecorationTheme: inputDecorationTheme,
    snackBarTheme: snackBarTheme,
    dialogTheme: dialogTheme,
    appBarTheme: const AppBarTheme(
      backgroundColor: primary,
      foregroundColor: Colors.white,
      elevation: 0,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontFamily: fontFamily,
        fontWeight: FontWeight.bold,
        fontSize: 20,
      ),
    ),
    disabledColor: disabled,
    dividerColor: border,
  );

  // Dark ThemeData
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: primaryDark,
    colorScheme: ColorScheme.dark(
      primary: primaryDark,
      secondary: accent,
      background: darkBackground,
      surface: darkSurface,
      error: error,
      onPrimary: Colors.white,
      onSecondary: Colors.black,
      onBackground: darkTextPrimary,
      onSurface: darkTextPrimary,
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: darkBackground,
    textTheme: textTheme.copyWith(
      displayLarge: textTheme.displayLarge?.copyWith(color: darkTextPrimary),
      displayMedium: textTheme.displayMedium?.copyWith(color: darkTextPrimary),
      titleMedium: textTheme.titleMedium?.copyWith(color: darkTextPrimary),
      bodyLarge: textTheme.bodyLarge?.copyWith(color: darkTextPrimary),
      bodyMedium: textTheme.bodyMedium?.copyWith(color: darkTextSecondary),
      bodySmall: textTheme.bodySmall?.copyWith(color: darkTextSecondary),
    ),
    fontFamily: fontFamily,
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: elevatedButtonStyle.copyWith(
        backgroundColor: MaterialStateProperty.all(primaryDark),
      ),
    ),
    cardTheme: cardTheme.copyWith(color: darkSurface),
    inputDecorationTheme: inputDecorationTheme.copyWith(
      fillColor: darkSurface,
      hintStyle: const TextStyle(color: darkTextSecondary),
      labelStyle: const TextStyle(color: darkTextPrimary),
    ),
    snackBarTheme: snackBarTheme.copyWith(
      backgroundColor: const Color(0xFF323232),
      contentTextStyle: const TextStyle(
        color: Colors.white,
        fontFamily: fontFamily,
        fontSize: 14,
      ),
    ),
    dialogTheme: dialogTheme.copyWith(
      backgroundColor: darkSurface,
      titleTextStyle: const TextStyle(
        color: darkTextPrimary,
        fontFamily: fontFamily,
        fontWeight: FontWeight.bold,
        fontSize: 20,
      ),
      contentTextStyle: const TextStyle(
        color: darkTextPrimary,
        fontFamily: fontFamily,
        fontSize: 16,
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: primaryDark,
      foregroundColor: Colors.white,
      elevation: 0,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontFamily: fontFamily,
        fontWeight: FontWeight.bold,
        fontSize: 20,
      ),
    ),
    disabledColor: disabled,
    dividerColor: border,
  );
} 