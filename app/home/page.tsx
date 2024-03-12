"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card";
import { useLocations, LocationsParams } from "../../services/openaq";
import { Pagination, Spinner } from "@nextui-org/react";

export default function Home() {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<string>("1");
  const [disabled, setDisabled] = useState<boolean>(true);

  const useLocationParams = useMemo(() => {
    const options: { [id: string]: any } = {};
    const isCoordinates = RegExp(/^-?\d+\.\d+,-?\d+\.\d+$/).exec(search);
    if (isCoordinates) {
      const [latitude, longitude] = search.split(",");
      options["coordinates"] = `${latitude},${longitude}`;
    } else {
      options["location"] = search;
    }
    options["page"] = page;
    return options as LocationsParams;
  }, [page, search]);

  const { locations, isLoading, lastPage, mutateLocations } = useLocations(
    useLocationParams,
    disabled
  );

  useEffect(() => {
    if (search && page !== "1") {
      setPage("1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const getUserCoordinates = useCallback(() => {
    document.scrollingElement?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const formattedCoordinates = `${latitude.toFixed(
            8
          )},${longitude.toFixed(8)}`;
          setSearch(formattedCoordinates);
          setDisabled(false);
        },
        () => {
          setDisabled(false);
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 10000 }
      );
    } else {
      setDisabled(false);
    }
  }, [setSearch, setDisabled]);

  useEffect(() => {
    getUserCoordinates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
        handleSearchMyLocation={getUserCoordinates}
      />
      <main
        className={`flex min-h-screen container flex-col items-center px-4 lg:px-16 py-14 mx-auto`}
      >
        {isLoading || disabled ? <Spinner size="lg" /> : <></>}
        {!isLoading && locations?.results.length === 0 && (
          <p>No results found</p>
        )}
        <div className="flex flex-col gap-6 w-full">
          {locations?.results.map((location) => (
            <Card key={location.id} location={location} />
          ))}
        </div>
        {locations?.results?.length! > 0 && (
          <Pagination
            color="primary"
            initialPage={1}
            total={lastPage}
            size="lg"
            page={Number(page)}
            onChange={(page) => {
              document.scrollingElement?.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              setPage(page.toString());
            }}
            className="mt-10"
          />
        )}
      </main>
    </>
  );
}
