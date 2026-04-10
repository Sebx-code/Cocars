<?php

namespace Tests\Unit;

use App\Services\VoiceSearchService;
use Carbon\Carbon;
use Tests\TestCase;

class VoiceSearchServiceTest extends TestCase
{
    private VoiceSearchService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new VoiceSearchService();
    }

    /**
     * Test du parsing complet d'une phrase vocale standard
     */
    public function test_parse_standard_voice_query()
    {
        $query = "je recherche un trajet douala yaounde demain a 16h j'ai 4000";
        
        $result = $this->service->parseSearchQuery($query);

        $this->assertEquals('Douala', $result['departure']);
        $this->assertEquals('Yaoundé', $result['destination']);
        $this->assertNotNull($result['date']);
        $this->assertEquals('16:00', $result['time']);
        $this->assertEquals(4000, $result['budget']);
        $this->assertNull($result['error']);
    }

    /**
     * Test extraction des villes avec variantes
     */
    public function test_extract_cities_with_variants()
    {
        $result = $this->service->parseSearchQuery("ydé to douala");
        
        $this->assertEquals('Yaoundé', $result['destination']);
        $this->assertEquals('Douala', $result['departure']);
    }

    /**
     * Test extraction de la date "demain"
     */
    public function test_extract_date_tomorrow()
    {
        $result = $this->service->parseSearchQuery("demain a 14h");
        
        $this->assertEquals(Carbon::tomorrow()->toDateString(), $result['date']);
    }

    /**
     * Test extraction de la date "aujourd'hui"
     */
    public function test_extract_date_today()
    {
        $result = $this->service->parseSearchQuery("aujourd'hui a 14h");
        
        $this->assertEquals(Carbon::today()->toDateString(), $result['date']);
    }

    /**
     * Test extraction de l'heure format "16h"
     */
    public function test_extract_time_format_h()
    {
        $result = $this->service->parseSearchQuery("a 16h");
        
        $this->assertEquals('16:00', $result['time']);
    }

    /**
     * Test extraction de l'heure format "14h30"
     */
    public function test_extract_time_format_h_with_minutes()
    {
        $result = $this->service->parseSearchQuery("a 14h30");
        
        $this->assertEquals('14:30', $result['time']);
    }

    /**
     * Test extraction de l'heure format "14:00"
     */
    public function test_extract_time_format_colon()
    {
        $result = $this->service->parseSearchQuery("a 14:45");
        
        $this->assertEquals('14:45', $result['time']);
    }

    /**
     * Test extraction du budget avec "j'ai"
     */
    public function test_extract_budget_with_jai()
    {
        $result = $this->service->parseSearchQuery("j'ai 5000");
        
        $this->assertEquals(5000, $result['budget']);
    }

    /**
     * Test extraction du budget avec "budget"
     */
    public function test_extract_budget_with_budget_keyword()
    {
        $result = $this->service->parseSearchQuery("budget 3500");
        
        $this->assertEquals(3500, $result['budget']);
    }

    /**
     * Test extraction du budget avec "prix"
     */
    public function test_extract_budget_with_prix_keyword()
    {
        $result = $this->service->parseSearchQuery("prix 2500");
        
        $this->assertEquals(2500, $result['budget']);
    }

    /**
     * Test validation d'une ville supportée
     */
    public function test_validate_city_supported()
    {
        $result = $this->service->validateCity('douala');
        $this->assertEquals('Douala', $result);

        $result = $this->service->validateCity('Yaounde');
        $this->assertEquals('Yaoundé', $result);
    }

    /**
     * Test validation d'une ville non supportée
     */
    public function test_validate_city_unsupported()
    {
        $result = $this->service->validateCity('paris');
        $this->assertNull($result);
    }

    /**
     * Test retour de la liste des villes supportées
     */
    public function test_get_supported_cities()
    {
        $cities = $this->service->getSupportedCities();
        
        $this->assertIsArray($cities);
        $this->assertContains('Douala', $cities);
        $this->assertContains('Yaoundé', $cities);
        $this->assertContains('Bamenda', $cities);
    }

    /**
     * Test avec erreur - pas de villes
     */
    public function test_parse_error_no_cities()
    {
        $result = $this->service->parseSearchQuery("je recherche un trajet demain a 16h");
        
        $this->assertNotNull($result['error']);
    }

    /**
     * Test phrase vide
     */
    public function test_parse_empty_query()
    {
        $result = $this->service->parseSearchQuery("");
        
        $this->assertNotNull($result['error']);
    }

    /**
     * Test avec variantes de villes (minuscules/accents)
     */
    public function test_parse_with_lowercase_accents()
    {
        $result = $this->service->parseSearchQuery("ydé vers douala");
        
        $this->assertEquals('Yaoundé', $result['destination']);
        $this->assertEquals('Douala', $result['departure']);
    }

    /**
     * Test extraction de budget sans mot-clé
     */
    public function test_extract_budget_fallback()
    {
        // Le service cherche le dernier nombre à 3-6 chiffres comme fallback
        $result = $this->service->parseSearchQuery("douala yaoundé 4500");
        
        $this->assertEquals(4500, $result['budget']);
    }
}
