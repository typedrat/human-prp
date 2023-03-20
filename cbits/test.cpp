#include <functional>
#include <iostream>
#include <map>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>

#include "feistel.h"

void interactive_test(direction_t direction);

std::map<std::string, std::pair<std::string, std::function<void()>>> options{
    {"e", {"Encrypt values", []() { interactive_test(direction_t::ENCRYPT); }}},
    {"d", {"Decrypt values", []() { interactive_test(direction_t::DECRYPT); }}},
    {"q", {"Quit", []() { return; }}}};

void menu_selection() {
    std::cout << "> ";

    std::string option;
    std::getline(std::cin, option);

    try {
        auto val = options.at(option);
        val.second();
    } catch (std::out_of_range &err) {
        std::cout << "Invalid option: " << option << std::endl;

        menu_selection();
    }
}

int main() {
    std::cout << "cycle_walking_cipher manual test harness" << std::endl;
    for (auto &[key, val] : options) {
        std::cout << key << ") " << val.first << std::endl;
    }

    menu_selection();

    std::cout << "Quitting..." << std::endl;

    return 0;
}

//

const uint64_t maxval = 15000000;
const uint64_t key = 0x69b1180877b71f1d;

void interactive_test(direction_t direction) {
    direction_t reverse = direction_t::DECRYPT;
    std::string first_result = "encrypted: ";
    std::string second_result = "decrypted: ";

    if (direction == direction_t::DECRYPT) {
        reverse = direction_t::ENCRYPT;
        std::swap(first_result, second_result);
    }

    uint64_t id = 0;
    std::string input_str;

    while (true) {
        std::cout << "id: ";

        std::getline(std::cin, input_str);
        std::stringstream input(input_str);

        if (input_str.empty()) {
            break;
        } else if (!(input >> id)) {
            std::cout << "Invalid id: " << input_str << std::endl;

            continue;
        }

        if (id <= maxval) {
            uint64_t ciphered_id =
                cycle_walking_cipher(maxval, id, key, direction);
            std::cout << first_result << ciphered_id << std::endl;

            uint64_t deciphered_id =
                cycle_walking_cipher(maxval, ciphered_id, key, reverse);
            std::cout << second_result << deciphered_id << std::endl;
        } else {
            std::cout << "id " << id << " too large. maxval: " << maxval
                      << std::endl;

            continue;
        }

        std::cout << std::endl;
    }
}