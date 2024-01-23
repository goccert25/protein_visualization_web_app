'use client'

import React, { Fragment, useState, useRef } from 'react'
import chroma from 'chroma-js'

import Molstar from './Molstar'

import { MultiValue, SingleValue, StylesConfig, components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { useLazyQuery, gql } from "@apollo/client";

const MULTI_TITLE_QUERY = gql`
  query Entries ($ids: [String!]!) {
    entries(entry_ids:$ids){
      struct {
          title
      }
    }
  }
`;

type ProteinOption = {
  value: string,
  label: string
};

const colourStyles: StylesConfig<ProteinOption, true> = {
  control: (styles) => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma('black');
    return {
      ...styles,
      backgroundColor: isFocused
        ? color.alpha(0.1).css()
        : "white",
      color: isSelected
        ? "black"
        : color.alpha(0.5).css()
    };
  },
};

function SingleValue(props: any) {
  const { children, ...rest } = props;
  const { selectProps } = props;
  if (selectProps.menuIsOpen) return <Fragment></Fragment>;
  return <components.SingleValue {...rest}>{children}</components.SingleValue>;
}

export default function Home() {
  const [pdbId, setPdbId] = useState("")
  const [description, setDescription] = useState("N/A")
  const [rendering, setRendering] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const [getTitles, { loading, error }] = useLazyQuery(MULTI_TITLE_QUERY)

  function onNewSelect(eventRaw: SingleValue<ProteinOption> | MultiValue<ProteinOption>): void {
    let event = eventRaw as SingleValue<ProteinOption>
    if (event!.value != pdbId) {
      setDescription(event!.label)
      setPdbId(event!.value)
      setRendering(true)
    }
  }

  const onLoad = () => {
    setRendering(false)
  }

  const loadOptions = (
    inputValue: string,
    callback: (options: ProteinOption[]) => void
  ) => {
    if (inputValue === "") return;
    // Define the search query
    const searchQuery = {
      "query": {
        "type": "group",
        "nodes": [
          {
            "type": "group",
            "nodes": [
              {
                "type": "terminal",
                "service": "text",
                "parameters": {
                  "attribute": "rcsb_entry_info.structure_determination_methodology",
                  "operator": "exact_match",
                  "value": "experimental"
                }
              },
              {
                "type": "terminal",
                "service": "text",
                "parameters": {
                  "attribute": "entity_poly.rcsb_entity_polymer_type",
                  "value": "Protein",
                  "operator": "exact_match"
                }
              }
            ],
            "logical_operator": "and",
            "label": "text"
          },
          {
            "type": "terminal",
            "service": "full_text",
            "parameters": {
              "value": inputValue
            }
          }
        ],
        "logical_operator": "and"
      },
      "return_type": "entry",
      "request_options": {
        "paginate": {
          "start": 0,
          "rows": 25
        },
        "results_content_type": [
          "experimental"
        ],
        "sort": [
          {
            "sort_by": "score",
            "direction": "desc"
          }
        ],
        "scoring_strategy": "combined"
      }
    };

    // Convert the search query to a URL-encoded string
    const queryString = encodeURIComponent(JSON.stringify(searchQuery));

    // Define the API endpoint
    const endpoint = `https://search.rcsb.org/rcsbsearch/v2/query?json=${queryString}`;

    const graphqlCallbackGenerator = (raw_ids: string[], callback: (options: ProteinOption[]) => void) => {
      const graphqlCallback = (titles_data: any) => {
        let options = []
        for (let i = 0; i < raw_ids.length; i = i + 1) {
          options.push({ value: raw_ids[i], label: titles_data.entries[i].struct.title })
        }
        callback(options)
      }
      return graphqlCallback
    }

    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        let options = []
        let raw_ids: string[] = []
        for (var datum of data.result_set) {
          options.push({ value: datum.identifier, label: datum.identifier })
          raw_ids.push(datum.identifier)
        }
        getTitles({
          variables: { ids: raw_ids }, onCompleted: graphqlCallbackGenerator(raw_ids, callback)
        })
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      fetchData();
    }, 500)
    // Call the fetchData function
  };

  return (
    <main>
      <div className="h-screen flex justify-center">
        <div className="w-full h-full max-h-[800px] max-w-[800px]">
          <div className="w-full flex justify-center">
            <h1 className="text-3xl m-md">Simple Protein Viewer</h1>
          </div>
          Protein Search:
          <AsyncSelect
            components={{ SingleValue }}
            styles={colourStyles}
            loadOptions={loadOptions}
            onChange={onNewSelect}
            placeholder="Search"
            loadingMessage={() => "Loading, may take a few seconds..."} />
          <div className="text-lg mt-md">Description:</div>
          <div className="text-lg mb-sm">{description}</div>
          {rendering && <div className="text-lg mb-sm">Rendering structure...</div>}
          <Molstar useInterface={false} pdbId={pdbId} onLoad={onLoad} />
          <div className="text-sm">
            Protein visualization library from https://molstar.org/
          </div>
        </div>
      </div>
    </main>
  )
}
