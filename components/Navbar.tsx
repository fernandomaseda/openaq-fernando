import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Input,
  Button,
} from "@nextui-org/react";
import { IoSearchOutline } from "react-icons/io5";
import { useLocationsSuggestions } from "../services/openaq";
import { memo } from "react";
import { MdOutlineMyLocation } from "react-icons/md";

interface NavbarProps {
  search: string;
  setSearch: (search: string) => void;
  handleSearchMyLocation?: () => void;
}

const NavbarComponent: React.FC<NavbarProps> = memo(
  ({ search, setSearch, handleSearchMyLocation }) => {
    const suggestions = useLocationsSuggestions();
    return (
      <Navbar maxWidth="lg">
        <NavbarBrand>
          <p className="font-bold">OPENAQ</p>
        </NavbarBrand>
        <NavbarContent className="flex" justify="center">
          <Input
            type="text"
            variant="bordered"
            placeholder="Search by Location or Coords"
            className="w-[50vw] max-w-96"
            size="md"
            radius="md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<IoSearchOutline className="text-gray-500" />}
            list={"locations"}
            endContent={
              <Button
                variant="solid"
                isIconOnly
                className="bg-transparent min-w-5 min-h-5 w-5 h-5"
                radius="full"
                onPress={handleSearchMyLocation}
              >
                <MdOutlineMyLocation className="text-blue-400 cursor-pinter text-xl" />
              </Button>
            }
          />
          {suggestions && (
            <datalist id="locations">
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          )}
        </NavbarContent>
      </Navbar>
    );
  }
);

NavbarComponent.displayName = "Navbar";

export default NavbarComponent;
