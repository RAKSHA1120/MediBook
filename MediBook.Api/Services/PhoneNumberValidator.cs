using System;
using System.Text.RegularExpressions;

namespace MediBook.Api.Services
{
    public static class PhoneNumberValidator
    {
        private static readonly Regex PhoneRegex = new Regex("^[0-9]{10}$", RegexOptions.Compiled);

        public const string ErrorMessage = "Phone number must be exactly 10 digits.";

        public static bool IsValid(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
            {
                return false;
            }

            return PhoneRegex.IsMatch(phone.Trim());
        }

        public static bool IsValid(string? phone, out string errorMessage)
        {
            if (string.IsNullOrWhiteSpace(phone))
            {
                errorMessage = "Phone number is required.";
                return false;
            }

            if (!PhoneRegex.IsMatch(phone.Trim()))
            {
                errorMessage = ErrorMessage;
                return false;
            }

            errorMessage = string.Empty;
            return true;
        }
    }
}
